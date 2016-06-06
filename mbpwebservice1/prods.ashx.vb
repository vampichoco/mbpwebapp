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

        Dim prodKey As String = context.Request.QueryString("p")

        Dim query = From prod In db.prods Where prod.ARTICULO = prodKey
                    Select New With {.ARTICULO = prod,
                                              .clavesadd = (From cadd In db.clavesadds Where cadd.Articulo = prod.ARTICULO Select cadd)}





        'context.Response.Write(xml.ToString())
        Dim json As New JavaScriptSerializer()
        If [single] = True Then
            context.Response.Write(json.Serialize(query.Single))
        Else
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


    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class