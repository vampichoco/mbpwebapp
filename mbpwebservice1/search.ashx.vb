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

            Dim prodsQuery = From prod In db.prods Where prod.ARTICULO.Contains(term) Or prod.DESCRIP.Contains(term)
                             Select New prodInSearch With {
                                 .ARTICULO = prod.ARTICULO,
                                 .DESCRIP = prod.DESCRIP,
                                 .PRECIO = prod.PRECIO1}


            context.Response.Write(json.Serialize(prodsQuery))

        Else
            Dim prodsQuery = From prod In db.prods
                             Select New prodInSearch With {
                                 .ARTICULO = prod.ARTICULO,
                                 .DESCRIP = prod.DESCRIP,
                                 .PRECIO = prod.PRECIO1}

            context.Response.Write(json.Serialize(prodsQuery))

        End If


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class

Public Class prodInSearch
    Private _DESCRIP As String
    Private _PRECIO As Double
    Private _ARTICULO As String

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



End Class