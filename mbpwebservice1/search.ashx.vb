Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization
Imports System.Linq.Dynamic

Public Class search
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim db As New mbpDataContext

        Dim json As New JavaScriptSerializer()

        If context.Request.QueryString("c") IsNot Nothing Then
            Dim term As String = HttpUtility.UrlDecode(
            context.Request.QueryString("c"))

            Dim prodsQuery = From prod In db.prods Where prod.ARTICULO.Contains(term) Or prod.DESCRIP.Contains(term) And prod.Bloqueado = 0
                             Select New With {
                                 .ARTICULO = prod.ARTICULO,
                                 .DESCRIP = prod.DESCRIP,
                                 .PRECIO = prod.PRECIO1 * 1.03,
                                 .PRECIO1 = prod.PRECIO1 * 1.03,
                                 .PRECIO2 = prod.PRECIO2 * 1.03,
                                 .PRECIO3 = prod.PRECIO3 * 1.03,
                                 .C1 = 0,
                                 .C2 = prod.C2,
                                 .C3 = prod.C3,
                                 .U = GetUniqueID(prod.ARTICULO),
                                 .TX = (From t In db.impuestos Where t.Impuesto = prod.IMPUESTO Select t.Valor / 100).Single,
                                 .CST = prod.COSTO,
                                 .EXISTENCIA = prod.EXISTENCIA,
                                 .clavesadd = (From cadd In db.clavesadds
                                               Where cadd.Articulo = prod.ARTICULO
                                               Select New With {
                                                   .Clave = cadd.Clave,
                                                   .Articulo = cadd.Articulo,
                                                   .Precio = cadd.Precio,
                                                   .Cantidad = cadd.Cantidad,
                                                   .Desc = cadd.Dato1,
                                                   .U = GetUniqueID(cadd.Clave)})
                                 }


            context.Response.Write(json.Serialize(prodsQuery))

        Else
            Dim prodsQuery = From prod In db.prods Where prod.Bloqueado = 0
                             Select New With {
                                 .ARTICULO = prod.ARTICULO,
                                 .DESCRIP = prod.DESCRIP,
                                 .PRECIO = prod.PRECIO1 * 1.03,
                                 .PRECIO1 = prod.PRECIO1 * 1.03,
                                 .PRECIO2 = prod.PRECIO2 * 1.03,
                                 .PRECIO3 = prod.PRECIO3 * 1.03,
                                 .C1 = 0,
                                 .C2 = prod.C2,
                                 .C3 = prod.C3,
                                 .U = GetUniqueID(prod.ARTICULO),
                                 .Tx = (From t In db.impuestos Where t.Impuesto = prod.IMPUESTO Select t.Valor / 100).Single,
                                 .CST = prod.COSTO,
                                 .EXISTENCIA = prod.EXISTENCIA,
                                 .clavesadd = (From cadd In db.clavesadds
                                               Where cadd.Articulo = prod.ARTICULO
                                               Select New With {
                                                   .Clave = cadd.Clave,
                                                   .Articulo = cadd.Articulo,
                                                   .Precio = cadd.Precio,
                                                   .Cantidad = cadd.Cantidad,
                                                   .Desc = cadd.Dato1,
                                                   .U = GetUniqueID(cadd.Clave)
                                                   })
                                 }

            context.Response.Write(json.Serialize(prodsQuery))

        End If


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

    Function GetUniqueID(ByVal str As String) As String
        Dim bytes = System.Text.Encoding.UTF8.GetBytes(str)

        Dim uniqueStr = Convert.ToBase64String(bytes)
        uniqueStr = uniqueStr.Replace("/", "_").Replace("+", "-").Replace("=", "")

        Return uniqueStr


    End Function
End Class

Public Class prodInSearch
    Private _DESCRIP As String
    Private _PRECIO As Double
    Private _ARTICULO As String
    Private _PRECIO1 As Double
    Private _PRECIO2 As Double
    Private _PRECIO3 As Double
    Private _C1 As Single
    Private _C2 As Single
    Private _C3 As Single
    Private _unique As String
    Private _Tx As Single

    Public Property DESCRIP As String
        Get
            Return _DESCRIP
        End Get
        Set(value As String)
            _DESCRIP = value
        End Set
    End Property

    Public Property PRECIO As Double
        Get
            Return _PRECIO
        End Get
        Set(value As Double)
            _PRECIO = value
        End Set
    End Property

    Public Property ARTICULO As String
        Get
            Return _ARTICULO
        End Get
        Set(value As String)
            _ARTICULO = value
        End Set
    End Property

    Public Property PRECIO1 As Double
        Get
            Return _PRECIO1
        End Get
        Set(value As Double)
            _PRECIO1 = value
        End Set
    End Property

    Public Property PRECIO2 As Double
        Get
            Return _PRECIO2
        End Get
        Set(value As Double)
            _PRECIO2 = value
        End Set
    End Property

    Public Property PRECIO3 As Double
        Get
            Return _PRECIO3
        End Get
        Set(value As Double)
            _PRECIO3 = value
        End Set
    End Property

    Public Property C1 As Single
        Get
            Return _C1
        End Get
        Set(value As Single)
            _C1 = value
        End Set
    End Property

    Public Property C2 As Single
        Get
            Return _C2
        End Get
        Set(value As Single)
            _C2 = value
        End Set
    End Property

    Public Property C3 As Single
        Get
            Return _C3
        End Get
        Set(value As Single)
            _C3 = value
        End Set
    End Property

    Public Property U As String
        Get
            Return _unique
        End Get
        Set(value As String)
            _unique = value
        End Set
    End Property

    Public Property Tx As Single
        Get
            Return _Tx
        End Get
        Set(value As Single)
            _Tx = value
        End Set
    End Property





End Class