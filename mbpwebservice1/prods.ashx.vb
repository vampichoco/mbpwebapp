Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization
Imports System.Linq.Dynamic

Public Class prods
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim db As New mbpDataContext



        'Dim queries As New Dictionary(Of String, Func(Of prod, Boolean))

        Dim [single] As Boolean = False

        If context.Request.QueryString("single") IsNot Nothing Then
            If context.Request.QueryString("single") = "true" Then
                [single] = True
            End If
        End If


        'Dim queryHelper As New mbpQuery
        'queryHelper.Populate()

        'Dim query As List(Of prod)

        'If context.Request.QueryString("qs") Is Nothing Then
        '    Dim q = context.Request.QueryString("q")

        '    For Each item In context.Request.QueryString.AllKeys
        '        queryHelper.AddVariable(item, context.Request.QueryString(item))
        '    Next

        '    Dim predicate = queryHelper.Query(q)

        '    query = db.prods.Where(predicate).Take(10).ToList()
        'Else
        '    Dim qs = context.Request.QueryString("qs")
        '    qs = HttpUtility.UrlDecode(qs)
        '    query = db.prods.Where(qs).Take(10).ToList()
        'End If 

        If context.Request.QueryString("p") IsNot Nothing Then
            Dim prodKey As String = context.Request.QueryString("p")

            Dim query = From prod In db.prods Where prod.ARTICULO = prodKey
                        Select New With {.ARTICULO = New With {.ARTICULO = prod.ARTICULO,
                            .SP = Trim(prod.ARTICULO),
                            .DESCRIP = prod.DESCRIP,
                            .PRECIO = prod.PRECIO4,
                            .PRECIO1 = prod.PRECIO4,
                            .PRECIO2 = prod.PRECIO5,
                            .PRECIO3 = prod.PRECIO6,
                            .C1 = prod.C4,
                            .C2 = prod.C5,
                            .C3 = prod.C6,
                            .U = GetUniqueID(Guid.NewGuid()),
                            .TX = (From t In db.impuestos Where t.Impuesto = prod.IMPUESTO Select t.Valor / 100).Single},
                            .clavesadd =
                            (From cadd In db.clavesadds Where cadd.Articulo = prod.ARTICULO
                             Select New With {.Clave = cadd.Clave,
                                 .Articulo = cadd.Articulo,
                                 .Precio = cadd.Precio,
                                 .Cantidad = cadd.Cantidad,
                                 .Desc = cadd.Dato1,
                                 .U = GetUniqueID(Guid.NewGuid())
                                 })
                            }


            'context.Response.Write(xml.ToString())
            Dim json As New JavaScriptSerializer()
            If [single] = True Then
                context.Response.Write(json.Serialize(query.Single))
            Else
                context.Response.Write(json.Serialize(query))
            End If

        Else

            Dim take As Integer = Integer.Parse(context.Request.QueryString("take"))


            Dim query = From prod In db.prods
                        Select New With {.ARTICULO = prod.ARTICULO,
                            .SP = Trim(prod.ARTICULO),
                            .DESCRIP = prod.DESCRIP,
                            .PRECIO = prod.PRECIO4,
                            .PRECIO1 = prod.PRECIO4,
                            .PRECIO2 = prod.PRECIO5,
                            .PRECIO3 = prod.PRECIO6,
                            .C1 = prod.C4,
                            .C2 = prod.C5,
                            .C3 = prod.C6,
                            .U = GetUniqueID(Guid.NewGuid()),
                            .TX = (From t In db.impuestos Where t.Impuesto = prod.IMPUESTO Select t.Valor / 100).Single,
                            .clavessadd = (From cadd In db.clavesadds Where cadd.Articulo = prod.ARTICULO
                                           Select New With {
                                               .Clave = cadd.Clave,
                                               .Articulo = cadd.Articulo,
                                               .Precio = cadd.Precio,
                                               .Cantidad = cadd.Cantidad,
                                               .Desc = cadd.Dato1,
                                               .U = GetUniqueID(Guid.NewGuid())
                                               })}
                        Take take

            'context.Response.Write(xml.ToString())
            Dim json As New JavaScriptSerializer()

            context.Response.Write(json.Serialize(query))

        End If


    End Sub

    Public Function GetProperties(ByVal ob As prod) As XElement
        Dim prod = <prod></prod>
        For Each item In ob.GetType().GetProperties()
            prod.Add(New XElement(item.Name, item.GetValue(ob, Nothing)))
        Next

        Return prod

    End Function

    Function GetUniqueID(ByVal guid As Guid) As String
        Dim bytes = guid.ToByteArray()

        Dim uniqueStr = Convert.ToBase64String(bytes)
        uniqueStr = uniqueStr.Replace("/", "_").Replace("+", "-").Replace("=", "")

        Return uniqueStr


    End Function


    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class